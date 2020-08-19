<template>
  <div class="app-container">
  <el-table
      ref="table"
      :key="tableKey"
      :data="listRows"
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
        <el-table-column 
            label="比赛等级" 
            :filters="[{text: $t('common.level.national'), value: '0'},{ text: $t('common.level.province'), value: '1' },{ text: $t('common.level.school'), value: '2' }]"
            :filter-method="filterLevel"
            class-name="level-col"
            align="center" min-width="100px"
        >
            <template slot-scope="{row}">
                <el-tag :type="rows.level | levelFilter">
                    <span>{{transLevel(row.level)}}</span>
                </el-tag>
            </template>
        </el-table-column>
        <!-- 比赛类型 -->
        <el-table-column 
            label="比赛类型" 
            :filters="[{text: $t('common.type.personal'), value: '0'},{ text: $t('common.type.team'), value: '1' }]"
            :filter-method="filterType"
            class-name="type-col"
            align="center" min-width="90px"
        >
            <template slot-scope="{row}">
                <el-tag :type="row.type | typeFilter">
                    {{ row.type === '1' ? $t('common.type.team') : $t('common.type.personal') }}
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
                "matchId": "1031284085326750552064",
                "title": "hello",
                "level": null,
                "type": null,
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
}
    }
  },
  created() {
    this.$get('studio/items/count').then(res => {
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