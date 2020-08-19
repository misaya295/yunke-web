<template>
  <div class="app-container">
  <!-- 表格区域 -->
  <el-table
      ref="table"
      :key="tableKey"
      :data="listRows"
      border
      fit
      style="width: 100%;"
    >
      <el-table-column type="selection" align="center" width="40px" />
      <!-- 论文id -->
      <el-table-column :label="$t('table.user.username')" prop="username" :show-overflow-tooltip="true" align="center" min-width="120px">
        <template slot-scope="scope">
          <span>{{ scope.row.thesisId }}</span>
        </template>
      </el-table-column>
      <!-- 论文标题 -->
      <el-table-column :label="$t('table.user.fullName')" prop="fullName" :show-overflow-tooltip="true" align="center" min-width="120px">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
       <!-- 论文介绍 -->
      <el-table-column :label="$t('table.user.email')" :show-overflow-tooltip="true" align="center" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.introduction }}</span>
        </template>
      </el-table-column>
       <!-- 论文类型 -->
      <el-table-column :label="$t('table.user.email')" :show-overflow-tooltip="true" align="center" min-width="150px">
       <template slot-scope="scope">
          <span>{{ scope.row.paperType }}</span>
        </template>
      </el-table-column>
      <!-- 论文时间  -->
      <el-table-column :label="$t('table.user.email')" :show-overflow-tooltip="true" align="center" min-width="150px">
      <template slot-scope="scope">
          <span>{{ scope.row.time }}</span>
        </template>
      </el-table-column>
       <!-- 论文地址  -->
      <el-table-column :label="$t('table.user.email')" :show-overflow-tooltip="true" align="center" min-width="150px">
       <template slot-scope="scope">
          <span>{{ scope.row.url }}</span>
        </template>
      </el-table-column>
       <!-- 论文费用  -->
       <el-table-column :label="$t('table.user.email')" :show-overflow-tooltip="true" align="center" min-width="150px">
      <template slot-scope="scope">
          <span>{{ scope.row.cost }}</span>
        </template>
      </el-table-column>
      <!-- 论文国家  -->
      <el-table-column :label="$t('table.user.email')" :show-overflow-tooltip="true" align="center" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.state }}</span>
        </template>
      </el-table-column>
       <!-- 论文发票  -->
      <el-table-column :label="$t('table.user.email')" :show-overflow-tooltip="true" align="center" min-width="150px">
       <template slot-scope="scope">
          <span>{{ scope.row.invoice }}</span>
        </template>
      </el-table-column>
         <!-- 论文补偿  -->
      <el-table-column :label="$t('table.user.email')" :show-overflow-tooltip="true" align="center" min-width="150px">
       <template slot-scope="scope">
          <span>{{ scope.row.reimbursement }}</span>
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
  </div>
</template>

<script>
export default {
  data(){
    return {
        tableKey: 0,
      // 论文任务数据
      listRows:[],
      // 假数据
      fakelist:{
    "message": "ok",
    "data": {
        "rows": [
            {
                "thesisId": "1041284068227974041600",
                "title": "hello",
                "introduction": null,
                "paperType": null,
                "time": null,
                "url": null,
                "cost": null,
                "state": null,
                "invoice": null,
                "reimbursement": null
            }
        ],
        "total": 1
    }
}
    }
  },
  created() {
    this.$get('studio/thesis/count').then(res => {
      console.log(res)
      // if(!("ok".equals(res.message))){
      //   return ;
      // }
      // this.listRows = res. data 
      // 假数据
      this.listRows= this.fakelist.data.rows
    })
  }
}
</script>
<style lang="scss" scoped>
</style>

