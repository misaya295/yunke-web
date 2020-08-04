<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="queryParams.key" :placeholder="$t('table.oss.qiniu.name')" class="filter-item search-item" />
      <el-button class="filter-item" type="primary" @click="search">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" type="warning" @click="reset">
        {{ $t('table.reset') }}
      </el-button>
      <el-dropdown v-has-any-permission="['qiniu:synchronized','qiniu:delete']" trigger="click" class="filter-item">
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-has-permission="['qiniu:config']"
            @click.native="config"
          >
            {{ $t('common.config') }}
          </el-dropdown-item>
          <el-dropdown-item
            v-has-permission="['qiniu:synchronized']"
            @click.native="synchronized"
          >
            {{ $t('common.synchronized') }}
          </el-dropdown-item>
          <el-dropdown-item
            v-has-permission="['qiniu:upload']"
            @click.native="upload"
          >
            {{ $t('common.upload') }}
          </el-dropdown-item>
          <el-dropdown-item
            v-has-permission="['qiniu:delete']"
            @click.native="batchDelete"
          >
            {{ $t('table.delete') }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-table
      ref="table"
      :key="tableKey"
      :data="list"
      border
      fit
      style="width: 100%;"
      @selection-change="onSelectChange"
    >
      <el-table-column type="selection" align="center" width="40px" />
      <el-table-column
        :label="$t('table.oss.qiniu.name')"
        prop="name"
        :show-overflow-tooltip="true"
        align="center"
      >
        <template slot-scope="scope">
          <a href="JavaScript:" class="el-link el-link--primary" target="_blank" type="primary" @click="download(scope.row.contentId)">{{ scope.row.name }}</a>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.oss.qiniu.suffix')"
        prop="suffix"
        :show-overflow-tooltip="true"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.suffix }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.oss.qiniu.bucket')"
        prop="bucket"
        :show-overflow-tooltip="true"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.bucket }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.oss.qiniu.size')"
        prop="size"
        :show-overflow-tooltip="true"
        align="center"
        min-width="80px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.size }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.oss.qiniu.type')"
        prop="type"
        :show-overflow-tooltip="true"
        align="center"
        min-width="90px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.oss.qiniu.updateTime')"
        prop="updateTime"
        :show-overflow-tooltip="true"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ (scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pagination.num"
      :limit.sync="pagination.size"
      @pagination="search"
    />
    <upload
      ref="upload"
      :dialog-visible="dialog.isVisible"
      :title="dialog.title"
      :type="dialog.type"
      @close="uploadClose"
      @success="uploadSuccess"
    />
    <Config
      ref="config"
      :dialog-visible="dialog.isConfigVisible"
      :title="dialog.title"
      :type="dialog.type"
      @close="configClose"
      @success="configSuccess"
    />
  </div>
</template>
<script>
import Pagination from '@/components/Pagination'
import Upload from './Upload'
import Config from './Config'

export default {
  name: 'OssQiNiuMange',
  components: { Pagination, Upload, Config },
  data() {
    return {
      dialog: {
        isVisible: false,
        isConfigVisible: false,
        title: '',
        type: ''
      },
      url: '',
      qiNiuConfig: '',
      dialogImageUrl: '',
      newWin: null,
      tableKey: 0,
      loading: false,
      list: null,
      total: 0,
      queryParams: {},
      selection: [],
      pagination: {
        size: 10,
        num: 1
      }
    }
  },
  watch: {
    url(newVal, oldVal) {
      if (newVal && this.newWin) {
        this.newWin.sessionStorage.clear()
        this.newWin.location.href = newVal
        this.url = ''
        this.newWin = null
      }
    }
  },
  mounted() {
    this.fetch()
    this.getConfig()
  },
  methods: {
    uploadSuccess() {
      this.search()
    },
    uploadClose() {
      this.dialog.isVisible = false
    },
    configClose() {
      this.dialog.isConfigVisible = false
    },
    configSuccess() {
      this.getConfig()
      this.dialog.isConfigVisible = false
    },
    onSelectChange(selection) {
      this.selection = selection
    },
    synchronized() {
      this.$post('oss/content/sync').then(() => {
        this.$message({
          showClose: true,
          message: '同步成功',
          duration: 5000,
          type: 'success'
        })
      })
      this.search()
    },
    getConfig() {
      this.$get(`oss/config`).then((r) => {
        this.qiNiuConfig = r.data.data
      })
    },
    // 下载文件
    download(id) {
      this.loading = true
      this.newWin = window.open()
      this.$get(`oss/content/download/${id}`).then((r) => {
        this.loading = false
        this.url = r.data.data
      })
    },
    config() {
      this.$refs.config.setConfig(this.qiNiuConfig)
      this.dialog.title = this.$t('common.config')
      this.dialog.isConfigVisible = true
      this.dialog.type = 'config'
    },
    upload() {
      this.dialog.title = this.$t('common.upload')
      this.dialog.isVisible = true
      this.dialog.type = 'upload'
    },
    batchDelete() {
      if (!this.selection.length) {
        this.$message({
          message: this.$t('tips.noDataSelected'),
          type: 'warning'
        })
        return
      }
      this.$confirm(this.$t('tips.confirmDelete'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        const contentIds = []
        this.selection.forEach((c) => {
          contentIds.push(c.contentId)
        })
        this.delete(contentIds)
      }).catch(() => {
        this.clearSelections()
      })
    },
    delete(contentIds) {
      this.loading = true
      this.$delete(`oss/content/${contentIds}`).then(() => {
        this.search()
        this.$message({
          message: '删除成功',
          type: 'success'
        })
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    search() {
      this.fetch({
        ...this.queryParams
      })
    },
    reset() {
      this.queryParams = {}
      this.search()
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      this.loading = true
      this.$get('oss/content', { ...params }).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
        this.loading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
