<template>
 <div class="app-container">
    <div class="filter-container">
        <!-- 任务id -->
        <el-input v-model="matchId" placeholder="任务id" class="filter-item search-item" />
        <!-- <el-input v-model="matchId" :placeholder="$t('data.rows.matchId')" class="filter-item search-item" /> -->
        <!-- 搜索 -->
        <el-button class="filter-item" type="primary" plain @click="search">
            {{ $t('table.search') }}
        </el-button>
        <!-- 重置 -->
        <el-button class="filter-item" type="warning" plain @click="reset">
            {{ $t('table.reset') }}
        </el-button>
        <!-- 更多操作 -->
                                            <!-- 这里应该是match -->
        <el-dropdown v-has-any-permission="['user:add','match:delete','match:export']" trigger="click" class="filter-item">
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['match:add']" @click.native="add">{{ $t('table.add') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['match:delete']" @click.native="batchDelete">{{ $t('table.delete') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['match:export']" @click.native="exportExcel">{{ $t('table.export') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- 表 -->
    <el-table
        ref="table"
      :key="tableKey"
      :data="list"
      border
      fit
      style="width: 100%;"
    >
        <el-table-column type="selection" align="center" width="40px" />
        <!-- 任务id -->
        <el-table-column label="任务id" prop="matchId" :show-overflow-tooltip="true" align="center" min-width="120px">
            <template slot-scope="scope">
                <span>{{ scope.row.matchId }}</span>
            </template>
        </el-table-column>
        <!-- <el-table-column :label="$t('data.rows.matchId')" prop="matchId" :show-overflow-tooltip="true" align="center" min-width="120px">
            <template slot-scope="data">
                <span>{{ data.rows.matchId }}</span>
            </template>
        </el-table-column> -->
        <!-- 任务标题 -->
        <el-table-column label="任务标题" prop="title" :show-overflow-tooltip="true" align="center" min-width="120px">
            <template slot-scope="scope">
                <span>{{ scope.row.title }}</span>
            </template>
        </el-table-column>
        <!-- <el-table-column :label="$t('data.rows.title')" prop="title" :show-overflow-tooltip="true" align="center" min-width="120px">
            <template slot-scope="data">
                <span>{{ data.rows.title }}</span>
            </template>
        </el-table-column> -->
        <!-- 比赛等级 -->
        <!-- :filters="[{text: $t('common.level.national'), value: '0'},{ text: $t('common.level.province'), value: '1' },{ text: $t('common.level.school'), value: '2' }]" -->
        <el-table-column 
            label="比赛等级" 
            :filters="[{text: '国家级', value: '0'},{ text: '省级', value: '1' },{ text: '校级', value: '2' }]"
            :filter-method="filterLevel"
            class-name="level-col"
            align="center" min-width="100px"
        >
            <!-- <template slot-scope="{row}">
                <el-tag :type="row.level | levelFilter">
                    <span>{{transLevel(row.level)}}</span>
                </el-tag>
            </template> -->
            <!-- 假数据 -->
            <template slot-scope="scope">
                <span>{{ scope.row.level }}</span>
            </template>
        </el-table-column>
        <!-- 比赛类型 -->
        <!-- :filters="[{text: $t('common.type.personal'), value: '0'},{ text: $t('common.type.team'), value: '1' }]" -->
        <el-table-column 
            label="比赛类型" 
            :filters="[{text:'个人', value: '0'},{ text: '团队', value: '1' }]"
            :filter-method="filterType"
            class-name="type-col"
            align="center" min-width="90px"
        >
            <template slot-scope="{row}">
                <el-tag :type="row.type | typeFilter">
                    {{ row.type === '1' ? '团队' : '个人' }}
                </el-tag>
            </template>
        </el-table-column>
        <!-- 申请书 -->
        <el-table-column label="申请书" prop="application_form" :show-overflow-tooltip="true" align="center" min-width="120px">
            <template slot-scope="scope">
                <span>{{ scope.row.application_form }}</span>
            </template>
        </el-table-column>
        <!-- 比赛时间 -->
        <el-table-column label="比赛时间" prop="time" :show-overflow-tooltip="true" align="center" min-width="160px">
            <template slot-scope="scope">
                <span>{{ scope.row.time }}</span>
            </template>
        </el-table-column>
        <!-- 花费 -->
        <el-table-column label="花费" prop="cost" :show-overflow-tooltip="true" align="center" min-width="50px">
            <template slot-scope="scope">
                <span>{{ scope.row.cost }}</span>
            </template>
        </el-table-column>
        <!-- 发票 -->
        <el-table-column label="发票" prop="invoice" :show-overflow-tooltip="true" align="center" min-width="120px">
            <template slot-scope="scope">
                <span>{{ scope.row.invoice }}</span>
            </template>
        </el-table-column>
        <!-- 证书 -->
        <el-table-column label="证书" prop="certificate" :show-overflow-tooltip="true" align="center" min-width="120px">
            <template slot-scope="scope">
                <span>{{ scope.row.certificate }}</span>
            </template>
        </el-table-column>
        <!-- 状态 -->
        <el-table-column 
            label="状态"
            :filters="[{text: $t('common.state.ongoing'), value: '0'},{ text: $t('common.state.completed'), value: '1' }]"
            :filter-method="filterState"
            class-name="state-col"
            align="center"
        >
            <template slot-scope="{row}">
                <el-tag :type="row.state | stateFilter">
                    {{ row.state === '1' ? $t('common.state.completed') : $t('common.state.ongoing') }}
                </el-tag>
            </template>
        </el-table-column>
        <!-- 是否已报销 -->
        <el-table-column 
            label="是否已报销" 
            :filters="[{text: $t('common.reimbursement.no'), value: '0'},{ text: $t('common.reimbursement.yes'), value: '1' }]"
            :filter-method="filterReimbursement"
            class-name="reimbursement-col"
            align="center"
        >
            <template slot-scope="row">
                <el-tag :type="row.reimbursement | reimbursementFilter">
                    {{ row.reimbursement === '1' ? $t('common.reimbursement.yes') : $t('common.reimbursement.no') }}
                </el-tag>
            </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column :label="$t('table.operation')" align="center" min-width="150px" class-name="small-padding fixed-width">
            <template slot-scope="{row}">
                <i v-hasPermission="['user:view']" class="el-icon-view table-operation" style="color: #87d068;" @click="view(row)" />
                <i v-hasPermission="['user:update']" class="el-icon-setting table-operation" style="color: #2db7f5;" @click="edit(row)" />
                <i v-hasPermission="['user:delete']" class="el-icon-delete table-operation" style="color: #f50;" @click="singleDelete(row)" />
                <el-link v-has-no-permission="['user:view','user:update','user:delete']" class="no-perm">
                    {{ $t('tips.noPermission') }}
                </el-link>
            </template>
        </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pagination.num" :limit.sync="pagination.size" @pagination="search" />
    <match-edit
      ref="edit"
      :dialog-visible="dialog.isVisible"
      :title="dialog.title"
      @success="editSuccess"
      @close="editClose"
    />
 </div>
</template>
<script>
import Pagination from '@/components/Pagination'
import MatchEdit from './Edit'
export default {
    name: 'MatchManage',
    components: { Pagination, MatchEdit},
    filters: {
    //比赛等级
    levelFilter(level) {
      const map = {
        0: '',
        1: '',
        2: ''
      }
      return map[level]
    },
    //比赛类型
    typeFilter(type) {
      const map = {
        0: '',
        1: ''
      }
      return map[type]
    },
    //状态
    filterState(state){
        const map = {
            0: 'danger',
            1: 'success'
        }
         return map[state]
    },
    //是否已报销
    reimbursementFilter(reimbursement){
      const map={
        0:'no',
        1:'yes'
      }
      return map[reimbursement]
    }
  },
   data(){
       return{
           dialog: {
              isVisible: false,
              title: ''
           },
          userViewVisible: false,
          tableKey: 0,
          loading: false,
          list: [],
          //total: 0,
          queryParams: {},
          sort: {},
          selection: [],
          pagination: {
            size: 10,
            num: 1
          },
          // 假数据
         fakelist:{
             "message": "ok",
             data:{
                 rows:[
                     {
                "matchId": "1031284085326750552064",
                "title": "蓝桥杯",
                "level": '1',
                "type": '0',
                "applicationForm": null,
                "time": null,
                "cost": null,
                "invoice": null,
                "certificate": null,
                "state": null,
                "reimbursement": null
                     }
                 ],
                 "total": 1
             }
         },
         
         matchId:''
       }
   },
   created() {
            this.$get('studio/match/count').then(res => {
            console.log(res)
            // if(!("ok".equals(res.message))){
            //   return ;
            // }
            // this.listRows = res. data 
            // 假数据
            this.list= this.fakelist.data.rows
            })
   },
   computed:{
       currentUser() {
            return this.$store.state.account.user
       }
   },
   mounted(){
       this.fetch()
   },
   methods:{
        // 比赛等级
       transLevel(level){
           switch (level) {
            case '0':
                return this.row.level=='国家级'
                //return this.$t('common.level.national')
            case '1':
                return this.row.level=='省级'
                //return this.$t('common.level.province')
            default:
                return this.row.levle=='校级'
                //return this.$t('common.level.school')
           }
       },
       filterLevel(value,row){
           return row.level === value
       },
       //比赛类型
       filterType(value, row) {
           return row.type === value
       },
        filterState(value, row){
            return row.state === value
        },
        filterReimbursement(value, row){
            return row.reimbursement === value
        },
        viewClose() {
            this.userViewVisible = false
        },
        editClose() {
            this.dialog.isVisible = false
        },
        editSuccess() {
            this.search()
        },
        onSelectChange(selection) {
            this.selection = selection
        },
        search() {
            this.fetch({
            ...this.queryParams,
            ...this.sort
            })
        },
        reset() {
            this.queryParams = {}
            this.sort = {}
            this.$refs.table.clearSort()
            this.$refs.table.clearFilter()
            this.search()
        },
        exportExcel() {
            this.$download('studio/task/match/excel', {
                 pageSize: this.pagination.size,
                 pageNum: this.pagination.num,
                 ...this.queryParams
            }, `user_${new Date().getTime()}.xlsx`)
        },
        add() {
            this.dialog.title = this.$t('common.add')
            this.dialog.isVisible = true
        },
        singleDelete(row) {
            this.$refs.table.toggleRowSelection(row, true)
            this.batchDelete()
        },
        //未搞定
        batchDelete() {
            if (!this.selection.length) {
                this.$message({
                    message: this.$t('tips.noDataSelected'),
                    type: 'warning'
                })
                return
            }
            let contain = false
            this.$confirm(this.$t('tips.confirmDelete'), this.$t('common.tips'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: 'warning'
            }).then(() => {
                const matchIds = []
                this.selection.forEach((u) => {
                  if (u.matchId === this.currentUser.matchId) {
                    contain = true
                    return
                  }
                  matchIds.push(u.matchId)
                })
            if (contain) {
                this.$message({
                    message: this.$t('tips.containCurrentUser'),
                    type: 'warning'
                })
                this.clearSelections()
            } else {
                this.delete(matchIds)
            }
            }).catch(() => {
                this.clearSelections()
            })
        },
        clearSelections() {
            this.$refs.table.clearSelection()
        },
        delete(matchIds) {
            this.loading = true
            this.$delete(`studio/match/{matchIds}`).then(() => {
                this.$message({
                    message: this.$t('tips.deleteSuccess'),
                    type: 'success'
                })
                this.search()
            })
        },
        view(row) {
      this.$refs.view.setUser(row)
      this.userViewVisible = true
    },
    edit(row) {
      let roleId = []
      if (row.roleId && typeof row.roleId === 'string') {
        roleId = row.roleId.split(',')
        row.roleId = roleId
      }
      this.$get(`system/user/${row.userId}`).then((r) => {
        row.deptIds = r.data.data
        this.$refs.edit.setUser(row)
        this.dialog.title = this.$t('common.edit')
        this.dialog.isVisible = true
      })
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      if (this.queryParams.timeRange) {
        params.createTimeFrom = this.queryParams.timeRange[0]
        params.createTimeTo = this.queryParams.timeRange[1]
      }
      this.loading = true
      this.$get('studio/match/count', {
        ...params
      }).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
        this.loading = false
      })
    },
    sortChange(val) {
        this.sort.field = val.prop
        this.sort.order = val.order
        this.search()
    }
   }
}
</script>
</script>
<style lang="scss" scoped>
</style>
